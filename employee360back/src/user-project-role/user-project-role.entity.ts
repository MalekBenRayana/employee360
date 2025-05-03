import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Project } from '../projects/project.entity';
import { ProjectRole } from '../project-role/project-role.entity';

@Entity('user_projects_roles')
export class UserProjectRole {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  project_id: number;

  @Column({ nullable: true })
  project_role_id: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => ProjectRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_role_id' })
  projectRole: ProjectRole;
}
