import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Fixed property name as well (originalname instead of originalName)
    }
});

export const upload = multer({ storage: storage });
