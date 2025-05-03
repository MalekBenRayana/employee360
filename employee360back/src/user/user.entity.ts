import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { Project } from '../projects/project.entity';
import { Department } from 'src/departments/department.entity';
import { ProjectAssignmentLog } from 'src/project-assignment-logs/project-assignment-log.entity';
import { EvaluationSession } from 'src/evaluation-session/evaluation-session.entity';
import { EvaluatorAssignment } from 'src/evaluator-assignment/evaluator-assignment.entity';
import { EvaluationResponse } from 'src/evaluation-response/evaluation-response.entity';
import { EmployeePointPeriodAggregate } from 'src/employee-point-period-aggregate/employee-point-period-aggregate.entity'; // Importez l'entité

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @Column({ type: 'varchar', nullable: true })
  resetToken?: string | null;

  @ManyToMany(() => Department, (department) => department.users)
  @JoinTable({
    name: 'department_users',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'department_id',
      referencedColumnName: 'department_id',
    },
  })
  departments: Department[];

  @ManyToMany(() => Project, (project) => project.users)
  projects: Project[];

  @OneToMany(() => Project, (project) => project.manager)
  managedProjects: Project[];

  @OneToMany(() => ProjectAssignmentLog, (log) => log.user)
  assignmentLogs: ProjectAssignmentLog[];

  // Utilisateur en tant qu'évalué
  @OneToMany(() => EvaluationSession, (session) => session.evaluatee)
  evaluationSessionsAsEvaluatee: EvaluationSession[];

  // Utilisateur en tant qu'évaluateur (via l'entité de liaison EvaluatorAssignment)
  @OneToMany(() => EvaluatorAssignment, (assignment) => assignment.evaluator)
  assignedEvaluations: EvaluatorAssignment[];

  @OneToMany(() => EvaluationResponse, (response) => response.evaluator)
  evaluatedResponsesAsEvaluator: EvaluationResponse[];

  @OneToMany(() => EvaluationResponse, (response) => response.evaluatee)
  evaluationResponsesAsEvaluatee: EvaluationResponse[];

  @OneToMany(
    () => EmployeePointPeriodAggregate,
    (aggregate) => aggregate.evaluatee,
  )
  pointPeriodAggregates: EmployeePointPeriodAggregate[];
}
