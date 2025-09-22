import { Table, Column, Model, DataType, Index, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Evaluation } from './evaluation.model';
import { Disclaimer } from './disclaimer.model';

@Table({
  tableName: 'consents',
  timestamps: true,
  indexes: [
    {
      fields: ['deviceId'],
      // Remove unique constraint on just deviceId - allow multiple versions per device
    },
    {
      fields: ['consentVersion'],
    },
    {
      fields: ['withdrawnAt'],
    },
    {
      fields: ['deviceId', 'consentVersion'],
      unique: true, // Composite unique constraint
    },
  ],
})
export class Consent extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: 'Unique device identifier (UUID)',
  })
  deviceId!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: 'Version of the consent agreement',
  })
  consentVersion!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    comment: 'Hash of the consent text shown to user',
  })
  consentTextHash!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'When consent was given',
  })
  agreedAt!: Date;

  @Column({
    type: DataType.STRING(500), // Increased from 50 to 500 to accommodate checkbox text
    allowNull: false,
    comment: 'Method used to capture consent',
  })
  evidence!: string;

  @ForeignKey(() => Disclaimer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Reference to the disclaimer version used',
  })
  disclaimerId!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When consent was withdrawn (null = active)',
  })
  withdrawnAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt!: Date;

  // Relationships
  @HasMany(() => Evaluation)
  evaluations!: Evaluation[];

  @BelongsTo(() => Disclaimer)
  disclaimer!: Disclaimer;

  // Helper methods
  isActive(): boolean {
    return !this.withdrawnAt;
  }

  getStatus(): 'active' | 'withdrawn' {
    return this.isActive() ? 'active' : 'withdrawn';
  }

  getDuration(): number {
    const endDate = this.withdrawnAt || new Date();
    return Math.floor((endDate.getTime() - this.agreedAt.getTime()) / (1000 * 60 * 60 * 24));
  }
}
