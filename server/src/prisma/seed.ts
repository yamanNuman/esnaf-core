import { DATABASE_URL } from "../constants/env";
import {Prisma, PrismaClient} from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashValue } from "../utils/bcrypt";

const adapter = new PrismaPg({
    connectionString: DATABASE_URL
});

export const prisma = new PrismaClient({
    adapter
}).$extends({
    result: {
        productCostPrice: {
            price: {
                compute(data) { return Number(data.price); }
            }
        },
        productSalePrice: {
            price: {
                compute(data) { return Number(data.price); }
            }
        },
        productStock: {
            quantity: {
                compute(data) { return Number(data.quantity); }
            },
            minQuantity: {
                compute(data) { return Number(data.minQuantity); }
            }
        },
        debt: {
            totalDebt: { compute(data) { return Number(data.totalDebt); } }
        },
        debtTransaction: {
            amount: { compute(data) { return Number(data.amount); } }
        },
        dailyEntry: {
            brokenCash: { compute(data) { return Number(data.brokenCash);}},
            expenses: { compute(data) { return Number(data.expenses);}},
            cardAmount: { compute(data) { return Number(data.cardAmount); } },
            cashAmount: { compute(data) { return Number(data.cashAmount); } },
            setAside: { compute(data) { return Number(data.setAside);}}
        },
        expense: {
            amount: { compute(data) { return Number(data.amount); } }
        },
        monthlyFixedExpense: {
            amount: { compute(data) { return data.amount ? Number(data.amount) : null; } }
        },
        monthlyAdditionalIncome: {
            amount: { compute(data) { return data.amount ? Number(data.amount) : null; } },
            spentAmount: { compute(data) { return data.spentAmount ? Number(data.spentAmount) : null; } }
        },
        monthlyCarryover: {
            amount: { compute(data) { return Number(data.amount); } }
        },
        setAsideTransaction: {
            amount: { compute(data) { return Number(data.amount); } }
        },
    }
    
});

async function main() {
    const hashedPassword = await hashValue("adminpass");

    const admin = await prisma.user.upsert({
        where: { email: "admin@esnaf.com" },
        update: {},
        create: {
            name: "Admin",
            email: "admin@esnaf.com",
            password: hashedPassword,
            verified: true,
            role: "ADMIN"
        }
    });
    
    if(admin.createdAt === admin.updatedAt) {
        console.log("Admin user created.");
    } else {
        console.log("Admin user already exists.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());