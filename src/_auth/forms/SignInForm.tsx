import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { SignInValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthProvider";

const SignInForm = () => {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<z.infer<typeof SignInValidation>>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof SignInValidation>) {
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    });

    if (!session) {
      return toast({ title: "Sign in failed. Please try again." });
    }

    const isLoggedIn = await checkAuthUser();
    console.log("User logged in:", isLoggedIn);

    if (isLoggedIn) {
      form.reset();

      console.log('navigate to "/"');
      navigate("/");
    } else {
      return toast({ title: "Sign in failed. please try again." });
    }
  }

  return (
    <Form {...form}>
      <div className="flex-center flex-col sm:w-420">
        <img src="/assets/images/logo.png" alt="logo" className="" />

        <h2
          className="h3-bold md:h2-bold pt-5 sm:pt-12
        "
        >
          Log in to your account{" "}
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-5 mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isUserLoading ? <BeatLoader color="white" /> : "Sign In"}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account?
            <Link
              to={`/sign-up`}
              className="text-blue-700 text-small-semibold ml-1"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignInForm;
