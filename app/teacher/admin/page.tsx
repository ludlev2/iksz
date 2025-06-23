'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LogOut, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Approval {
  id: string;
  studentId: string;
  studentName: string;
  opportunityId: string;
  opportunityTitle: string;
  hours: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  evidence: string;
}

export default function TeacherAdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }

    // Load pending approvals
    fetch('/data/mock-approvals.json')
      .then(res => res.json())
      .then((data: Approval[]) => {
        setApprovals(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading approvals:', err);
        setIsLoading(false);
      });
  }, [user, router]);

  const handleApprovalToggle = (approvalId: string, approved: boolean) => {
    setApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { ...approval, status: approved ? 'approved' : 'rejected' }
          : approval
      )
    );

    toast.success(
      approved ? 'Óra jóváhagyva!' : 'Óra elutasítva!',
      {
        description: approved 
          ? 'Az óra hozzáadva a diák teljesített óráihoz.'
          : 'Az óra elutasítva, a diák értesítést kap.'
      }
    );
  };

  const handleBulkApprove = () => {
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    setApprovals(prev => 
      prev.map(approval => 
        approval.status === 'pending' 
          ? { ...approval, status: 'approved' }
          : approval
      )
    );

    toast.success(`${pendingApprovals.length} óra tömeges jóváhagyása sikeres!`);
  };

  const handleExportPDF = () => {
    // Mock PDF export
    toast.success('PDF jelentés exportálása megkezdődött!', {
      description: 'A fájl hamarosan letöltésre kerül.'
    });
  };

  if (isLoading) {
    return <div>Betöltés...</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tanári adminisztráció</h1>
            <p className="text-gray-600">{user.name} - {user.school}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jóváhagyásra vár</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jóváhagyott</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Elutasított</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleExportPDF} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                PDF Export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={handleBulkApprove}
            disabled={pendingCount === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Összes jóváhagyása ({pendingCount})
          </Button>
        </div>

        {/* Approvals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jóváhagyásra váró órák</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nincs jóváhagyásra váró óra.
                </div>
              ) : (
                approvals.map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{approval.studentName}</h3>
                          <Badge variant={
                            approval.status === 'approved' ? 'default' :
                            approval.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {approval.status === 'approved' ? 'Jóváhagyva' :
                             approval.status === 'rejected' ? 'Elutasítva' :
                             'Függőben'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Program:</strong> {approval.opportunityTitle}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Dátum:</strong> {approval.date} • <strong>Órák:</strong> {approval.hours}h
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Bizonyíték:</strong> {approval.evidence}
                        </p>
                      </div>
                      
                      {approval.status === 'pending' && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Elutasít</label>
                            <Switch
                              checked={false}
                              onCheckedChange={(checked) => 
                                handleApprovalToggle(approval.id, checked)
                              }
                            />
                            <label className="text-sm">Jóváhagy</label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}