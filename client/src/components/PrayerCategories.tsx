"use client";

import { useState } from "react";
import { LuX, LuPlus, LuHeart, LuFamily, LuHealth, LuWork, LuFinance, LuEducation, LuTravel, LuOther } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface PrayerCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const defaultCategories: PrayerCategory[] = [
  { id: "1", name: "General", icon: Heart, color: "bg-blue-500" },
  { id: "2", name: "Family", icon: Family, color: "bg-pink-500" },
  { id: "3", name: "Health", icon: Health, color: "bg-green-500" },
  { id: "4", name: "Work", icon: Work, color: "bg-purple-500" },
  { id: "5", name: "Finance", icon: Finance, color: "bg-yellow-500" },
  { id: "6", name: "Education", icon: Education, color: "bg-orange-500" },
  { id: "7", name: "Travel", icon: Travel, color: "bg-teal-500" },
  { id: "8", name: "Other", icon: Other, color: "bg-gray-500" },
];

interface PrayerCategorySelectProps {
  selected?: string[];
  onChange?: (categories: string[]) => void;
}

export function PrayerCategorySelect({ selected = [], onChange }: PrayerCategorySelectProps) {
  const [customCategories, setCustomCategories] = useState<PrayerCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const allCategories = [...defaultCategories, ...customCategories];

  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onChange?.(selected.filter(c => c !== id));
    } else {
      onChange?.([...selected, id]);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const category: PrayerCategory = {
      id: `custom-${Date.now()}`,
      name: newCategory,
      icon: Other,
      color: "bg-indigo-500",
    };
    
    setCustomCategories([...customCategories, category]);
    setNewCategory("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Categories</label>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selected.includes(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? `${category.color} text-white`
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {category.name}
            </button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {showAdd && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory}>Add</Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PrayerTagInputProps {
  tags?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
}

export function PrayerTagInput({ tags = [], onChange, suggestions = [] }: PrayerTagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange?.(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px]">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
        />
      </div>

      {input && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => addTag(suggestion)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export const prayerTagSuggestions = [
  "urgent",
  "answered",
  "praise",
  "thanksgiving",
  "healing",
  "protection",
  "guidance",
  "breakthrough",
  "peace",
  "strength",
];
