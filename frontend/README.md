              {
                location.state?.data?.status != "approved" && (
                  <CardFooter className="flex justify-center py-6">
                      <Button type="submit" className="px-8 py-2 text-lg mx-3">
                        {
                          (location?.state?.data?.status === "pending_quality" && user.team.flag === "QA") ? "Reject":"Submit"
                        }
                      </Button>
                      {
                        (location?.state?.data?.status === "pending_quality" && user.team === "QA") && (
                          <Button  type="button" className="px-8 py-2 text-lg mx-3" onClick={()=>{handleApprove(location.state?.data?._id)}}>
                          Approve
                        </Button>
                        )
                      } 
                      <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent className="sm:max-w-[400px]">
                          <DialogHeader>
                            <DialogTitle>Form Approved ✅</DialogTitle>
                          </DialogHeader>
                          <div className="mt-2">
                            The form has been approved and the report has been generated.
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setIsOpen(false)}>Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>     
                  </CardFooter>
                )
              }