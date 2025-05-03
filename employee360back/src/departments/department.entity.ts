import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  department_id: number;

  @Column()
  department_name: string;

  @ManyToOne(() => User, (user) => user.departments)
  @JoinColumn({ name: 'department_head_id' })
  department_head: User;

  @ManyToMany(() => User, (user) => user.departments)
  @JoinTable({
    name: 'department_users',
    joinColumn: {
      name: 'department_id',
      referencedColumnName: 'department_id',
    },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToMany(() => Project, (project) => project.departments, {
    cascade: true,
  })
  @JoinTable({
    name: 'department_projects',
    joinColumn: {
      name: 'department_id',
      referencedColumnName: 'department_id',
    },
    inverseJoinColumn: {
      name: 'project_id',
      referencedColumnName: 'project_id',
    },
  })
  projects: Project[];
}
