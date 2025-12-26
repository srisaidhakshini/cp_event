import mongoose, { Schema, Document, Model } from "mongoose";

/*
 * Consolidated Team Interface
 * Supports both PR 1 (Round 1) and PR 2 (Round 2) structures.
 */
export interface ITeam extends Document {
  // Fields from Round 1 (PR 1)
  teamName?: string;
  email?: string;

  // Fields from Round 2 (PR 2)
  name?: string;
  teamId?: string;
  members?: string[];
  lastSync?: Date | null;

  // Shared Fields
  codeforcesHandle?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/*
 * Consolidated Team Schema
 */
const TeamSchema: Schema<ITeam> = new Schema(
  {
    // Round 1 Fields
    // 'sparse: true' allows these to be missing in Round 2 documents without error
    teamName: { 
      type: String, 
      unique: true, 
      sparse: true, 
      trim: true 
    },
    email: { 
      type: String, 
      unique: true, 
      sparse: true, 
      trim: true 
    },

    // Round 2 Fields
    teamId: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    name: { 
      type: String, 
      sparse: true,
      trim: true 
    },
    members: [{ type: String }],

    // Shared Fields
    codeforcesHandle: { 
      type: String, 
      default: null, 
      trim: true 
    },
    lastSync: { 
      type: Date, 
      default: null 
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

/**
 * Team Model
 * Checks mongoose.models.Team first to prevent hot-reload crashes
 */
const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;