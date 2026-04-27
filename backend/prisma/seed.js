"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt_1.default.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@reviewapp.com' },
        update: {},
        create: {
            email: 'admin@reviewapp.com',
            name: 'System Administrator',
            address: '123 Admin Street, Tech City',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    console.log('Created Admin User:');
    console.log(`Email: admin@reviewapp.com`);
    console.log(`Password: Admin@123`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map