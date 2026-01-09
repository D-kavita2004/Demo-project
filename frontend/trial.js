
                  {/* ====================== ISSUING SECTION ====================== */}
                        <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                          <AccordionItem value="item-1" className="w-full">
                            <AccordionTrigger><h2 className="text-2xl font-semibold border-b pb-2">Issuing Section</h2></AccordionTrigger>

                            <AccordionContent className="w-full">
                              <PermissionedSection sectionKey="issuingSection" isNewForm={isNewForm} formStatus={clickedForm?.status} >
                                <div className="w-full grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">
                                  {/* Receiving No. */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="receivingNo">Receiving No.</Label>
                                    <Input
                                      id="receivingNo"
                                      placeholder="Enter receiving number"
                                      {...register("issuingSection.receivingNo")}
                                    />
                                    {errors.issuingSection?.receivingNo && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.receivingNo.message}</p>
                                    )}
                                  </div>

                                  {/* Reference No. */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="referenceNo">Reference No.</Label>
                                    <Input
                                      id="referenceNo"
                                      placeholder="Enter reference number"
                                      {...register("issuingSection.referenceNo")}
                                    />
                                    {errors.issuingSection?.referenceNo && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.referenceNo.message}</p>
                                    )}
                                  </div>


                                </div>
                              </PermissionedSection>
                            </AccordionContent>
                          </AccordionItem>
                        </section>

