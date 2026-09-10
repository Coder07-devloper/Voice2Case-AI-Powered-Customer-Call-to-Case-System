import mongoose from 'mongoose';
const noteSchema = new mongoose.Schema({ case: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportCase', required: true, index: true }, agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, note: { type: String, required: true, trim: true, maxlength: 3000 } }, { timestamps: true });
export default mongoose.model('Note', noteSchema);
