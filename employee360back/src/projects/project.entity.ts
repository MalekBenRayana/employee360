import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Department } from 'src/departments/department.entity';
import { ProjectAssignmentLog } from 'src/project-assignment-logs/project-assignment-log.entity';
import { Role } from 'src/roles/role.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  project_id: number;

  @Column()
  project_name: string;

  @Column('text')
  description: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  status: string;

  @Column()
  priority: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToMany(() => Department, (department) => department.projects)
  @JoinTable({
    name: 'department_projects',
    joinColumn: { name: 'project_id', referencedColumnName: 'project_id' },
    inverseJoinColumn: {
      name: 'department_id',
      referencedColumnName: 'department_id',
    },
  })
  departments: Department[];

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable({
    name: 'user_projects_roles',
    joinColumn: { name: 'project_id', referencedColumnName: 'project_id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToMany(() => Role, (role) => role.projects)
  roles: Role[];

  @ManyToOne(() => User, (user) => user.managedProjects)
  manager: User;

  @OneToMany(() => ProjectAssignmentLog, (log) => log.project)
  assignmentLogs: ProjectAssignmentLog[];

  @OneToMany(() => EvaluationSession, (session) => session.project)
  evaluationSessions: EvaluationSession[];
}
