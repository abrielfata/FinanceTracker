const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon('postgresql://neondb_owner:npg_ibSINHtv9d8p@ep-orange-mud-aofgbm9c-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    console.log('Adding siklus_tgl to users...');
    await sql`ALTER TABLE users ADD COLUMN siklus_tgl integer NOT NULL DEFAULT 26;`;
    console.log('Column added successfully!');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  }

  try {
    console.log('Adding unique constraint to budget...');
    await sql`ALTER TABLE budget ADD CONSTRAINT budget_user_id_kategori_bulan_tahun_unique UNIQUE(user_id, kategori, bulan, tahun);`;
    console.log('Constraint added successfully!');
  } catch (err) {
    console.log(err.message);
  }
}

run();
