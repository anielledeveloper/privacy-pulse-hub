import { Column, DataType, Model, Table, Index } from 'sequelize-typescript';

@Table({
  tableName: 'submission_locks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['deviceId', 'date'],
    },
  ],
})
export class SubmissionLock extends Model<SubmissionLock> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  deviceId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    primaryKey: true,
  })
  date: Date;
}
