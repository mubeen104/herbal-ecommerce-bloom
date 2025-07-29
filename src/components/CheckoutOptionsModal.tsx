import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserPlus, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface CheckoutOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutOptionsModal = ({ isOpen, onClose }: CheckoutOptionsModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestCheckout = async () => {
    setIsLoading(true);
    // Add a small delay for better UX
    setTimeout(() => {
      onClose();
      navigate("/checkout?guest=true");
      setIsLoading(false);
    }, 500);
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/auth?redirect=checkout");
  };

  // If user is already logged in, skip this modal
  if (user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Choose Your Checkout Option</DialogTitle>
          <DialogDescription className="text-base">
            How would you like to complete your purchase?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-6">
          {/* Guest Checkout Option */}
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
            <CardContent className="p-6">
              <Button
                onClick={handleGuestCheckout}
                variant="ghost"
                className="w-full h-auto p-0 hover:bg-transparent group-hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                <div className="flex items-start space-x-4 text-left">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Continue as Guest</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Quick checkout without creating an account. You'll still receive order confirmation and tracking.
                    </p>
                    <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                      <span>• Faster checkout</span>
                      <span className="mx-2">•</span>
                      <span>No registration required</span>
                    </div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Login Option */}
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
            <CardContent className="p-6">
              <Button
                onClick={handleLoginRedirect}
                variant="ghost"
                className="w-full h-auto p-0 hover:bg-transparent group-hover:scale-105 transition-transform"
              >
                <div className="flex items-start space-x-4 text-left">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Login or Create Account</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Save your details for faster future checkouts and track your order history.
                    </p>
                    <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <span>• Order history</span>
                      <span className="mx-2">•</span>
                      <span>Saved addresses</span>
                      <span className="mx-2">•</span>
                      <span>Faster returns</span>
                    </div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onClose} className="px-8">
            Back to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOptionsModal;