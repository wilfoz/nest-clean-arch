export type FieldsError = {
  [field: string]: string[];
};

export interface IValidatorFieldsInterface<PropsValidated> {
  errors: FieldsError;
  validatedData: PropsValidated;

  validate(data: any): boolean;
}
