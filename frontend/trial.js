// Watch file input for preview
const productImageFile = watch("defectivenessDetail.productImage");
const preview = productImageFile && productImageFile[0]
  ? URL.createObjectURL(productImageFile[0])
  : clickedForm?.formData?.defectivenessDetail?.productImage || "";

// In your JSX:
<div className="flex flex-col space-y-1.5 md:col-span-2">
  <Label htmlFor="productImage">Product Image</Label>
  <Input
    id="productImage"
    type="file"
    accept="image/*"
    {...register("defectivenessDetail.productImage")}
  />
  {errors.defectivenessDetail?.productImage && (
    <p className="text-sm text-red-500">{errors.defectivenessDetail.productImage.message}</p>
  )}

  {/* Image preview */}
  {preview && (
    <div className="mt-3 flex justify-center">
      <a href={preview} target="_blank" rel="noopener noreferrer">
        <img
          src={preview}
          alt="Preview"
          className="max-w-full max-h-40 object-contain rounded-md border border-gray-300 shadow-sm hover:scale-105 transition-transform duration-200"
        />
      </a>
    </div>
  )}
</div>
