import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsCommaSeparatedEnum(
  enumType: object,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isCommaSeparatedEnum',
      target: object.constructor,
      propertyName,
      constraints: [enumType],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any, args: ValidationArguments) {
          const [enumObj] = args.constraints as [object];
          if (typeof value !== 'string') return false;
          const parts = value.split(',');
          return parts.every((val) => Object.values(enumObj).includes(val));
        },
        defaultMessage(args: ValidationArguments) {
          const [enumObj] = args.constraints as [object];
          return `${args.property} must be a comma separated list of the following values: ${Object.values(enumObj).join(', ')}`;
        },
      },
    });
  };
}
