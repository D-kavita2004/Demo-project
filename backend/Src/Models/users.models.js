import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
  },

  { timestamps: true },
);


/* ---------------------------------------------------
   AUTO-SET TEAM FOR ADMIN (Runs on create + save)
-----------------------------------------------------*/
// userSchema.pre("save", function (next) {
//   if (this.role === "admin") {
//     this.team = "it";
//   }
//   next();
// });


export default mongoose.model("User", userSchema);
