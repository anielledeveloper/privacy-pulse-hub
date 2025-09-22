import { Column, DataType, Model, Table, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { Guideline } from './guideline.model';
import { Consent } from './consent.model';

@Table({
  tableName: 'evaluations',
  timestamps: true,
  indexes: [
    {
      fields: ['deviceId'],
    },
    {
      fields: ['consentVersion'],
    },
    {
      fields: ['deviceId', 'consentVersion'],
    },
    {
      fields: ['createdAt'],
    },
  ],
})
export class Evaluation extends Model<Evaluation> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Guideline)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  guidelineId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  })
  percentage: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any>;

  @ForeignKey(() => Consent)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Reference to consent record',
  })
  consentId: number;

  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: 'Device identifier for consent tracking',
  })
  deviceId: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: 'Consent version when evaluation was submitted',
  })
  consentVersion: string;

  @BelongsTo(() => Guideline)
  guideline: Guideline;

  @BelongsTo(() => Consent)
  consent: Consent;
}
