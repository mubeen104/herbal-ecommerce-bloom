import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserPlus, ShoppingCart, ArrowRight, Check, Zap } from "lucide-react";
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
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[95vw] md:max-w-2xl border-0 p-0 overflow-hidden bg-card/95 backdrop-blur-xl h-[calc(100vh-4rem)] sm:h-auto">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative p-4 sm:p-6 md:p-8 overflow-y-auto max-h-full">
          <DialogHeader className="text-center space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {/* Floating Icon with Pulse Animation */}
            <div className="relative mx-auto mt-2 sm:mt-0">
              <div className="absolute inset-0 w-14 sm:w-20 h-14 sm:h-20 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="relative w-14 sm:w-20 h-14 sm:h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                <ShoppingCart className="w-7 sm:w-10 h-7 sm:h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Choose how you'd like to proceed with your order
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Guest Checkout Option - Enhanced */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-4 sm:p-6 md:p-8">
                <Button
                  onClick={handleGuestCheckout}
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                  disabled={isLoading}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                      {/* Enhanced Icon Design */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-xl sm:rounded-2xl blur-lg"></div>
                        <div className="relative p-3 sm:p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-xl sm:rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      
                      <div className="text-left space-y-3 sm:space-y-4 w-full">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                              Continue as Guest
                            </h3>
                            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-fit">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">FASTEST</span>
                            </div>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                            Quick and secure checkout without account creation. Perfect for one-time purchases.
                          </p>
                        </div>
                        
                        {/* Enhanced Features List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Instant checkout</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>No registration</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Order tracking</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Email confirmation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="hidden sm:block w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Login Option - Enhanced */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-4 sm:p-6 md:p-8">
                <Button
                  onClick={handleLoginRedirect}
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                      {/* Enhanced Icon Design */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-xl sm:rounded-2xl blur-lg"></div>
                        <div className="relative p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-xl sm:rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                          <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="text-left space-y-3 sm:space-y-4 w-full">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                              Create Account or Login
                            </h3>
                            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">RECOMMENDED</span>
                            </div>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                            Unlock member benefits and streamline future purchases with a personal account.
                          </p>
                        </div>
                        
                        {/* Enhanced Features List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Order history</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Saved addresses</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Faster returns</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>Exclusive offers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="hidden sm:block w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Back to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOptionsModal;