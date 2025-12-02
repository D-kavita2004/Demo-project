        {
          user && user.role === "admin" && (
            <Route
            path="/Admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            {/* Use relative paths, no leading slash */}
            <Route path="" element={<ProtectedRoute><AdminFeaturesOverview/></ProtectedRoute>} />
            <Route path="Users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
            <Route path="Suppliers" element={<ProtectedRoute><Suppliers/></ProtectedRoute>} />
            <Route path="Parts" element={<ProtectedRoute><PartNames/></ProtectedRoute>} />
            <Route path="Processes" element={<ProtectedRoute><ProcessNames/></ProtectedRoute>} />
            <Route path="Machines" element={<ProtectedRoute><MachineNames/></ProtectedRoute>} />
            </Route>
          )
        }