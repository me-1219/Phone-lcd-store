import express from "express";
import {
    getUsers,
    getUserById,
    updateMyProfile,
    toggleBlockUser,
    updateUserRole,
    deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.put("/me", updateMyProfile);

router.get("/", authorize("admin"), getUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id/block", authorize("admin"), toggleBlockUser);
router.put("/:id/role", authorize("admin"), updateUserRole);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;