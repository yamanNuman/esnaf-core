import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import { getCategoriesHandler, getPriceHistoryHandler, createProductHandler, deleteProductHandler, getProductHandler, getProductsHandler, updateProductHandler } from "../controllers/product.controller";

const productRouter = Router();

//USER + ADMIN
productRouter.get('/categories', catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getCategoriesHandler));
productRouter.get('/', catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getProductsHandler));
productRouter.get('/:id', catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getProductHandler));
productRouter.get('/:id/price-history', catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getPriceHistoryHandler));
//ADMIN
productRouter.post('/', catchErrors(authenticate), authorize("ADMIN"), catchErrors(createProductHandler));
productRouter.put('/:id', catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateProductHandler));
productRouter.delete('/:id', catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteProductHandler));

export default productRouter;