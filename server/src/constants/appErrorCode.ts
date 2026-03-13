enum AppErrorCode {
    InvalidAccessToken = "InvalidAccessToken",
    EmailAlreadyInUser = "EmailAlreadyInUse",
    InvalidCredentials = "InvalidCredentials",
    SessionExpired = "SessionExpired",
    NotAuthenticated = "NotAuthenticated",
    UserNotFound = "UserNotFound",
    InvalidRefreshToken = "InvalidRefreshToken",
    SessionNotFound = "SessionNotFound",
    InvalidVerificationCode = "InvalidVerificationCode",
    UnauthorizedAccess = "UnauthorizedAccess",
    ProductNotFound = "ProductNotFound",
    DebtNotFound = "DebtNotFound",
    TaxNotFound = "TaxNotFound",
    TaxCalendarAlreadyExists = "TaxCalendarAlreadyExists",
    DailyEntryNotFound = "DailyEntryNotFound",
    ExpenseNotFound = "ExpenseNotFound",
    MonthlyFixedExpenseNotFound = "MonthlyFixedExpenseNotFound",
    MonthlyAdditionalIncomeNotFound = "MonthlyAdditionalIncomeNotFound",
    FixedExpenseTemplateNotFound = "FixedExpenseTemplateNotFound",
    AdditionalIncomeTemplateNotFound = "AdditionalIncomeTemplateNotFound",
    MonthlyAlreadyExists = "MonthlyAlreadyExists"
}

export default AppErrorCode;