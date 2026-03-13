import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import { CategoryProvider } from './context/CategoryProvider.tsx';
import { DebtProvider } from './context/DebtProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <CategoryProvider>
        <DebtProvider>
            <App />
        </DebtProvider>
    </CategoryProvider>
)
