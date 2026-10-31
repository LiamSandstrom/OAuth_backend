import "dotenv/config"
import { seedDemoData } from "./demoData.js"
import { prisma } from "../src/repos/client.js"

seedDemoData()
    .then(({ owner, posts, readers }) => console.log(`Seeded ${posts} posts and ${readers} readers for ${owner}`))
    .catch(err => {
        console.error(err.message)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
