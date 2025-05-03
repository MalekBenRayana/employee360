import { Exclude, Expose } from 'class-transformer';

export class FilteredUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;
}
