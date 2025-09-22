import { Column, DataType, Model, Table, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { Guideline } from './guideline.model';

@Table({
  tableName: 'guideline_daily_aggregates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['guidelineId', 'date'],
    },
    {
      fields: ['date'],
    },
  ],
})
export class GuidelineDailyAggregate extends Model<GuidelineDailyAggregate> {
  @ForeignKey(() => Guideline)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  guidelineId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    primaryKey: true,
  })
  date: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  sum: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  })
  average: number;

  @BelongsTo(() => Guideline)
  guideline: Guideline;
}
