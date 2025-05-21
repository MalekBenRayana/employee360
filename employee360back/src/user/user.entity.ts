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
import { TimeTracking } from '../time-tracking/time-tracking.entity';
import { EmployeeSelfEvaluation } from '../employee-self-evaluation/employee-self-evaluation.entity';
import { EmployeePointPeriodAggregate } from '../employee-point-period-aggregate/employee-point-period-aggregate.entity';
import { Department } from '../departments/department.entity';
import { EvaluationResponse } from '../evaluation-response/evaluation-response.entity';
import { EvaluationSession } from '../evaluation-session/evaluation-session.entity';
import { EvaluatorAssignment } from '../evaluator-assignment/evaluator-assignment.entity';
import { ProjectAssignmentLog } from '../project-assignment-logs/project-assignment-log.entity';

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

  @OneToMany(() => EvaluationSession, (session) => session.evaluatee)
  evaluationSessionsAsEvaluatee: EvaluationSession[];

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

  @OneToMany(
    () => EmployeeSelfEvaluation,
    (selfEvaluation) => selfEvaluation.evaluatee,
  )
  selfEvaluations: EmployeeSelfEvaluation[];

  @OneToMany(() => TimeTracking, (timeTracking) => timeTracking.user)
  timeTrackings: TimeTracking[];

 
}
