import { Document, Schema, model } from 'mongoose';
import Post from './post.interface';

const PostSchema = new Schema({
    author: String,
    authorId: String,
    title: String,
    content: String,
});

const PostModel = model<Post & Document>('Post', PostSchema);

export default PostModel;