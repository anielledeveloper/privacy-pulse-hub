import { Table, Column, Model, DataType, HasMany, Index } from 'sequelize-typescript';
import { Consent } from './consent.model';

@Table({
  tableName: 'disclaimers',
  timestamps: true,
  indexes: [
    { fields: ['version'], unique: true },
    { fields: ['disclaimerHash'], unique: true },
    { fields: ['isActive'] },
  ],
})
export class Disclaimer extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Version identifier for the disclaimer',
  })
  version!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Full disclaimer text content',
  })
  disclaimerText!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'SHA-256 hash of the disclaimer text',
  })
  disclaimerHash!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this disclaimer version is currently active',
  })
  isActive!: boolean;

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
  @HasMany(() => Consent)
  consents!: Consent[];
}
