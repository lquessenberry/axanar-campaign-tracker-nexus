import React, { useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Settings, Users, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LCARSDemo() {
  const [systemStatus, setSystemStatus] = useState("operational");
  const [progress, setProgress] = useState(75);

  return (
    <div className="min-h-screen bg-background circuit-pattern">
      {/* LCARS Header */}
      <div className="nav-lcars">
        <a href="#systems">Systems</a>
        <a href="#tactical">Tactical</a>
        <a href="#operations">Operations</a>
        <a href="#communications">Communications</a>
      </div>

      <div className="container mx-auto p-6">
        {/* Main LCARS Interface */}
        <div className="lcars-panel-system">
          {/* System Status Panel */}
          <div className="lcars-display-panel lcars-corner">
            <h3>System Status</h3>
            <div className="content space-y-4">
              <div className="flex items-center justify-between">
                <span>Main Power</span>
                <div className="lcars-status active">
                  <CheckCircle className="w-4 h-4" />
                  ONLINE
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Life Support</span>
                <div className="lcars-status active">
                  <CheckCircle className="w-4 h-4" />
                  NOMINAL
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Tactical Systems</span>
                <div className="lcars-status warning">
                  <AlertTriangle className="w-4 h-4" />
                  STANDBY
                </div>
              </div>
            </div>
          </div>

          {/* Data Processing Panel */}
          <div className="lcars-display-panel">
            <h3>Data Processing</h3>
            <div className="content space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm font-mono">{progress}%</span>
                </div>
                <div className="lcars-progress">
                  <div 
                    className="lcars-progress-bar" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="lcars-data-grid">
                <div className="lcars-data-cell header">Metric</div>
                <div className="lcars-data-cell header">Value</div>
                <div className="lcars-data-cell">Memory</div>
                <div className="lcars-data-cell">4.7 GB</div>
                <div className="lcars-data-cell">Network</div>
                <div className="lcars-data-cell">1.2 Gb/s</div>
                <div className="lcars-data-cell">Storage</div>
                <div className="lcars-data-cell">847 TB</div>
              </div>
            </div>
          </div>

          {/* Operations Panel */}
          <div className="lcars-display-panel">
            <h3>Operations</h3>
            <div className="content space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button className="btn-lcars">
                  <Activity className="w-4 h-4 mr-2" />
                  Diagnostics
                </Button>
                <Button className="btn-lcars-secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button className="btn-lcars">
                  <Users className="w-4 h-4 mr-2" />
                  Personnel
                </Button>
                <Button className="btn-lcars-alert">
                  <Database className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* LCARS Form Demo */}
        <div className="mt-8">
          <h2 className="text-2xl font-trek-heading mb-6">System Configuration</h2>
          <div className="lcars-form max-w-2xl">
            <div className="lcars-form-group">
              <label className="lcars-form-label">Command Authorization</label>
              <input 
                type="text" 
                className="lcars-form-input" 
                placeholder="Enter authorization code"
              />
            </div>
            <div className="lcars-form-group">
              <label className="lcars-form-label">System Priority</label>
              <select className="lcars-form-input">
                <option>Normal Operations</option>
                <option>Alert Status</option>
                <option>Red Alert</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button className="btn-lcars">Execute Command</Button>
              <Button className="btn-lcars-secondary">Cancel</Button>
            </div>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="mt-8">
          <h2 className="text-2xl font-trek-heading mb-6">Personnel Registry</h2>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rank</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>James T. Kirk</td>
                <td>Captain</td>
                <td>Command</td>
                <td><span className="lcars-status active">Active</span></td>
              </tr>
              <tr>
                <td>Spock</td>
                <td>Commander</td>
                <td>Science</td>
                <td><span className="lcars-status active">Active</span></td>
              </tr>
              <tr>
                <td>Leonard McCoy</td>
                <td>Lt. Commander</td>
                <td>Medical</td>
                <td><span className="lcars-status active">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LCARS Alerts */}
        <div className="mt-8 space-y-4">
          <div className="lcars-alert info">
            <strong>System Information:</strong> All primary systems are operating within normal parameters.
          </div>
          <div className="lcars-alert warning">
            <strong>Maintenance Advisory:</strong> Scheduled maintenance for auxiliary power systems in 2 hours.
          </div>
        </div>
      </div>
    </div>
  );
}