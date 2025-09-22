import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { Evaluation } from './evaluation.model';
import { GuidelineDailyAggregate } from './guideline-daily-aggregate.model';

@Table({
  tableName: 'guidelines',
  timestamps: true,
})
export class Guideline extends Model<Guideline> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any>;

  @HasMany(() => Evaluation)
  evaluations: Evaluation[];

  @HasMany(() => GuidelineDailyAggregate)
  dailyAggregates: GuidelineDailyAggregate[];
}
