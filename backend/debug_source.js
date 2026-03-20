import mongoose from 'mongoose';
import Source from './src/models/Source.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = 'mongodb+srv://chaitraligharge_db_user:C2HKWO71Zwjmu30z@learnsphere.vl6vxo4.mongodb.net/?retryWrites=true&w=majority&appName=LearnSphere';

async function checkSource() {
    try {
        await mongoose.connect(uri, { dbName: 'test' });
        console.log('Connected to DB');

        const id = '698d7b5847de53eba1bacdfa'; // The ID likely from user's logs, but let's check basic listing if exact ID fails

        // Check if ID is valid format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`ID ${id} is NOT a valid ObjectId format`);
        } else {
            const source = await Source.findById(id);
            if (source) {
                console.log('Source found:', source._id);
                console.log('Metadata:', source.metadata);
                if (source.metadata && source.metadata.text) {
                    console.log('Text length:', source.metadata.text.length);
                } else {
                    console.log('Text MISSING in metadata');
                }
            } else {
                console.log('Source NOT found with ID:', id);
                // List all sources to see what we have
                const all = await Source.find({}).limit(5);
                console.log('First 5 sources in DB:', all.map(s => ({ id: s._id, name: s.originalName })));
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSource();
