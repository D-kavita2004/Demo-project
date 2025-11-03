          <div className="md:col-span-2">
            <Label>Defectiveness Detail</Label>
            <Textarea
              {...register("defectDetails", { required: "Please provide defect details" })}
              placeholder="Describe the defect in detail..."
              className="h-28"
            />
            {errors.defectDetails && <p className="text-red-500 text-sm">{errors.defectDetails.message}</p>}
          </div>