import { validate } from 'class-validator';

import { IsCommaSeparatedEnum } from '@common/base/application/validator/comma-separated-enum.validator';

describe('IsCommaSeparatedEnum', () => {
  enum TestEnum {
    first = 'first',
    second = 'second',
    third = 'third',
  }

  class TestDto {
    @IsCommaSeparatedEnum(TestEnum)
    enums?: string;
  }

  it('Should allow valid comma separated enum values', async () => {
    const dto = new TestDto();
    dto.enums = `${TestEnum.first},${TestEnum.second},${TestEnum.third}`;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should deny invalid comma separated enum values', async () => {
    const dto = new TestDto();
    dto.enums = 'regular,invalid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isCommaSeparatedEnum).toEqual(
      `enums must be a comma separated list of the following values: ${Object.values(TestEnum).join(', ')}`,
    );
  });

  it('Should deny other types than string', async () => {
    const dto = new TestDto();
    (dto as unknown as { enums: string[] }).enums = ['regular', 'admin'];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isCommaSeparatedEnum).toEqual(
      `enums must be a comma separated list of the following values: ${Object.values(TestEnum).join(', ')}`,
    );
  });
});
