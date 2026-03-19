import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../constants/env";

const groq = new Groq({ apiKey: GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

export const analyzeMonthlySummaryService = async (summary: {
    year: number;
    month: number;
    totalRevenue: number;
    totalExpenses: number;
    shopRemaining: number;
    generalRemaining: number;
    inPocket: number;
    totalAdditionalIncome: number;
    totalSetAside: number;
    totalSetAsideSpent: number;
    carryoverAmount: number;
    totalCardCommission: number;
}) => {
    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `Sen bir küçük işletme muhasebe asistanısın. Türkçe, kısa ve net yanıtlar ver. Rakamları analiz et, somut önerilerde bulun. Madde madde yaz, maksimum 5 madde.`
            },
            {
                role: "user",
                content: `Aşağıdaki aylık muhasebe özetini analiz et ve yorumla:
                
Ay: ${summary.month}/${summary.year}
Toplam Hasılat: ${summary.totalRevenue.toFixed(2)}₺
Toplam Gider: ${summary.totalExpenses.toFixed(2)}₺
Dükkan Kalan: ${summary.shopRemaining.toFixed(2)}₺
Genel Kalan: ${summary.generalRemaining.toFixed(2)}₺
Cepte Olan: ${summary.inPocket.toFixed(2)}₺
Ek Gelir: ${summary.totalAdditionalIncome.toFixed(2)}₺
Kenara Ayrılan: ${summary.totalSetAside.toFixed(2)}₺
Kenara Ayrılandan Harcanan: ${summary.totalSetAsideSpent.toFixed(2)}₺
Devir: ${summary.carryoverAmount.toFixed(2)}₺
Kart Komisyonu: ${summary.totalCardCommission.toFixed(2)}₺`
            }
        ],
        max_tokens: 500,
    });

    return completion.choices[0].message.content;
};

export const analyzeStockService = async (products: {
    name: string;
    category: string;
    unit: string;
    stocks: { type: string; quantity: number; minQuantity: number }[];
}[]) => {
    const lowStock = products.filter(p =>
        p.stocks.some(s => s.minQuantity > 0 && s.quantity <= s.minQuantity)
    );

    if (lowStock.length === 0) {
        return "Düşük stoklu ürün bulunmuyor. Not: Daha iyi stok takibi için ürünlere minimum stok miktarı (minQuantity) girilmesi önerilir.";
    }

    // Sadece ilk 15 düşük stoklu ürünü gönder
    const toAnalyze = lowStock.slice(0, 15);

    const stockSummary = toAnalyze.map(p =>
        `- ${p.name}: ${p.stocks.map(s =>
            `${s.type === "PACKAGE" ? "K" : "A"}:${s.quantity}(min:${s.minQuantity})`
        ).join(", ")}`
    ).join("\n");

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `Stok asistanısın. Türkçe, kısa yaz. Maks 5 madde.`
            },
            {
                role: "user",
                content: `Düşük stoklu ürünler (${lowStock.length} adet):\n${stockSummary}\n\nÖncelik sırasına göre değerlendir.`
            }
        ],
        max_tokens: 400,
    });

    return completion.choices[0].message.content;
};

export const analyzeDebtsService = async (debts: {
    name: string;
    totalDebt: number;
    dueDate?: string;
    note?: string;
}[]) => {
    const now = new Date();
    const debtSummary = debts.map(d => {
        let dueDateStr = "Belirtilmemiş";
        let daysLeft = null;
        if (d.dueDate) {
            const due = new Date(d.dueDate);
            daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            dueDateStr = `${due.toLocaleDateString("tr-TR")} (${daysLeft > 0 ? `${daysLeft} gün kaldı` : `${Math.abs(daysLeft)} gün geçti`})`;
        }
        return `- ${d.name}: ${d.totalDebt.toFixed(2)}₺, Vade: ${dueDateStr}`;
    });

    const totalDebt = debts.reduce((acc, d) => acc + d.totalDebt, 0);

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `Sen bir küçük işletme finans asistanısın. Türkçe, kısa ve net yanıtlar ver. Borçları öncelik sırasına göre değerlendir, ödeme önerisi sun. Maksimum 5 madde.`
            },
            {
                role: "user",
                content: `Aşağıdaki borç durumunu analiz et ve öncelik sırasına göre değerlendir:

Toplam Borç: ${totalDebt.toFixed(2)}₺
Borç Sayısı: ${debts.length}

Borçlar:
${debtSummary.join("\n")}

Hangi borçlar önce ödenmeli, genel değerlendirme yap.`
            }
        ],
        max_tokens: 500,
    });

    return completion.choices[0].message.content;
};