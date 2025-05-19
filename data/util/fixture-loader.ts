import { resolve } from 'path';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import {
  Builder,
  Loader,
  Parser,
  Resolver,
  fixturesIterator,
} from 'typeorm-fixtures-cli/dist';

export const loadFixtures = async (
  fixturesPath: string,
  datasourceOptions: DataSourceOptions,
): Promise<void> => {
  let dataSource: DataSource | undefined;

  try {
    dataSource = new DataSource(datasourceOptions);

    await dataSource.initialize();
    await dataSource.synchronize(true);

    const loader = new Loader();
    loader.load(resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(dataSource, new Parser(), false);

    for (const fixture of fixturesIterator(fixtures)) {
      const entity = await builder.build(fixture);
      await dataSource
        .getRepository(fixture.entity as EntityTarget<ObjectLiteral>)
        .save(entity);
    }
  } finally {
    if (dataSource) {
      await dataSource.destroy();
    }
  }
};
