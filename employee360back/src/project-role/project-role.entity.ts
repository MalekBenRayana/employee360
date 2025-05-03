import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserProjectRole } from 'src/user-project-role/user-project-role.entity';

@Entity()
export class ProjectRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => UserProjectRole,
    (userProjectRole) => userProjectRole.projectRole,
  )
  userProjectRoles: UserProjectRole[];
}
