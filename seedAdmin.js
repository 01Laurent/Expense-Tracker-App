const bcrypt = require("bcryptjs");
const { User } = require("./models");

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash("calebkg", 10);
        const adminUser = await User.create({
            name: "Admin",
            username: "admin",
            email: "admincalebkg@gmail.com",
            password: hashedPassword,
            role: "admin", 
        });
        console.log("Admin user created successfully:", adminUser);
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
}

createAdminUser();
