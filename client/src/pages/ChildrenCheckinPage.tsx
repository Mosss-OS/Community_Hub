import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Baby, Check, Users, UserPlus } from "lucide-react";
import { Helmet } from "react-helmet-async";

const AGE_GROUPS = [
  { id: "0-2", label: "0-2 years", minAge: 0, maxAge: 2 },
  { id: "3-5", label: "3-5 years", minAge: 3, maxAge: 5 },
  { id: "6-8", label: "6-8 years", minAge: 6, maxAge: 8 },
  { id: "9-12", label: "9-12 years", minAge: 9, maxAge: 12 },
];

interface CheckedInChild {
  id: string;
  name: string;
  age: number;
  ageGroup: string;
  parentName: string;
  checkinTime: string;
  allergies?: string;
}

export default function ChildrenCheckinPage() {
  const { toast } = useToast();
  const [checkedInChildren, setCheckedInChildren] = useState<CheckedInChild[]>([]);
  const [formData, setFormData] = useState({
    childName: "",
    age: "",
    parentName: "",
    parentPhone: "",
    allergies: "",
  });

  const handleCheckin = () => {
    if (!formData.childName || !formData.age || !formData.parentName) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const age = parseInt(formData.age);
    const ageGroup = AGE_GROUPS.find(g => age >= g.minAge && age <= g.maxAge)?.id || "unassigned";

    const child: CheckedInChild = {
      id: Date.now().toString(),
      name: formData.childName,
      age,
      ageGroup,
      parentName: formData.parentName,
      checkinTime: new Date().toLocaleTimeString(),
      allergies: formData.allergies || undefined,
    };

    setCheckedInChildren([...checkedInChildren, child]);
    setFormData({
      childName: "",
      age: "",
      parentName: "",
      parentPhone: "",
      allergies: "",
    });

    toast({ title: `${child.name} checked in successfully!` });
  };

  const handleCheckout = (id: string) => {
    const child = checkedInChildren.find(c => c.id === id);
    setCheckedInChildren(checkedInChildren.filter(c => c.id !== id));
    toast({ title: `${child?.name} checked out successfully!` });
  };

  const childrenByGroup = AGE_GROUPS.map(group => ({
    ...group,
    children: checkedInChildren.filter(c => c.ageGroup === group.id),
  }));

  return (
    <>
      <Helmet>
        <title>Children's Check-in - Community Hub</title>
      </Helmet>
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Children's Ministry Check-in</h1>
            <p className="text-muted-foreground mt-2">Age-segmented check-in system for children's church</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Check-in Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Check-in Child
                  </CardTitle>
                  <CardDescription>Register a child for children's church</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="childName">Child's Name *</Label>
                    <Input
                      id="childName"
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      placeholder="Enter child's name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="12"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Enter age"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Enter parent's name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="Enter parent's phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies/Notes</Label>
                    <Input
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="Any allergies or special notes"
                    />
                  </div>

                  <Button onClick={handleCheckin} className="w-full">
                    <Baby className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Checked-in Children by Age Group */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Checked-in Children ({checkedInChildren.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {checkedInChildren.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No children checked in yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {childrenByGroup.map(group => 
                        group.children.length > 0 ? (
                          <div key={group.id}>
                            <h3 className="font-semibold mb-2">
                              {group.label} 
                              <Badge className="ml-2">{group.children.length}</Badge>
                            </h3>
                            <div className="space-y-2">
                              {group.children.map(child => (
                                <div key={child.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <p className="font-medium">{child.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Age: {child.age} | Parent: {child.parentName}
                                      {child.allergies && ` | Allergies: ${child.allergies}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Checked in: {child.checkinTime}</p>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => handleCheckout(child.id)}>
                                    <Check className="mr-1 h-3 w-3" />
                                    Check Out
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
