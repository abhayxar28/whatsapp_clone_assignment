"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupComponent() {
  const [country, setCountry] = useState("1");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<string>(""); // Base64 string
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePictureChange = (file: File | null) => {
    if (!file) {
      setPicture("");
      setPreviewUrl(null);
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Convert file to base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fullPhone = `${country}${phone}`;

    try {
      const payload = {
        wa_id: fullPhone,
        name,
        picture, 
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/create-user`,
        payload
      );

      const data = res.data;
      localStorage.setItem("token", data.token);
      toast.success("Signup Successful");
      router.push("/signin");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Signin unsuccessful");
      setPhone("");
      setName("");
      setPicture("");
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <Card className="w-[360px] rounded-xl shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#25D366"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 2.39-.94 4.57-2.47 6.13a8.96 8.96 0 0 1-6.53 2.87c-1.63 0-3.17-.39-4.5-1.07L3 21l1.07-4.5A8.96 8.96 0 0 1 3 12z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">WhatsApp</CardTitle>
          <p className="text-sm text-gray-500">
            Create a new account to start messaging
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Profile Picture */}
            <div className="space-y-1">
              <Label htmlFor="picture">Profile Picture</Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={(e) => handlePictureChange(e.target.files?.[0] || null)}
              />
              {previewUrl && (
                <div className="mt-2 w-24 h-24 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Phone number */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-[100px] cursor-pointer">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">US +1</SelectItem>
                    <SelectItem value="91">IN +91</SelectItem>
                    <SelectItem value="81">JP +81</SelectItem>
                    <SelectItem value="44">UK +44</SelectItem>
                    <SelectItem value="61">AU +61</SelectItem>
                    <SelectItem value="64">NZ +64</SelectItem>
                    <SelectItem value="65">SG +65</SelectItem>
                    <SelectItem value="971">AE +971</SelectItem>
                    <SelectItem value="49">DE +49</SelectItem>
                    <SelectItem value="33">FR +33</SelectItem>
                    <SelectItem value="39">IT +39</SelectItem>
                    <SelectItem value="92">PK +92</SelectItem>
                    <SelectItem value="34">ES +34</SelectItem>
                    <SelectItem value="86">CN +86</SelectItem>
                    <SelectItem value="852">HK +852</SelectItem>
                    <SelectItem value="82">KR +82</SelectItem>
                    <SelectItem value="55">BR +55</SelectItem>
                    <SelectItem value="27">ZA +27</SelectItem>
                    <SelectItem value="7">RU +7</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#1ebc59]"
              disabled={loading}
            >
              {loading ? "Sending..." : "Next"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center">
          <a href="#" className="text-green-600 text-sm hover:underline">
            Create new account
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
