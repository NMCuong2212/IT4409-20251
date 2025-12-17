const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect("mongodb+srv://20225268:20225268@cluster0.8jg9clk.mongodb.net/it4409")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB Error:", err));

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên không được để trống'],
        minlength: [2, 'Tên phải có ít nhất 2 ký tự']
    },
    age: {
        type: Number,
        required: [true, 'Tuổi không được để trống'],
        min: [0, 'Tuổi phải >= 0']
    },
    email: {
        type: String,
        required: [true, 'Email không được để trống'],
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    address: {
        type: String
    }
});

const User = mongoose.model("User", UserSchema);

app.get("/api/users", async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        const search = (req.query.search || "").trim();

        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (limit > 50) limit = 50;

        const filter = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                      { address: { $regex: search, $options: "i" } }
                  ]
              }
            : {};

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({ page, limit, total, totalPages, data: users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/api/users", async (req, res) => {
    try {
        let { name, age, email, address } = req.body;

        if (!name || !email) return res.status(400).json({ error: "Tên và Email là bắt buộc" });
        name = name.trim();
        email = email.trim().toLowerCase();
        address = (address || "").trim();
        age = parseInt(age);
        if (isNaN(age) || age < 0) age = 0;

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ error: "Email đã tồn tại" });

        const newUser = new User({ name, age, email, address });
        await newUser.save();

        res.status(201).json({ message: "Thêm user thành công", data: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "ID không hợp lệ" });

        const updates = {};
        ["name", "age", "email", "address"].forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                if (typeof req.body[field] === "string") updates[field] = req.body[field].trim();
                else updates[field] = req.body[field];
            }
        });

        if (updates.email) {
            updates.email = updates.email.toLowerCase();
            const exist = await User.findOne({ email: updates.email, _id: { $ne: id } });
            if (exist) return res.status(400).json({ error: "Email đã tồn tại" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedUser) return res.status(404).json({ error: "User không tồn tại" });

        res.json({ message: "Cập nhật thành công", data: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        res.json({ message: "Xóa người dùng thành công" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
