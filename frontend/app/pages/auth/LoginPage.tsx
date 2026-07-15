import { Eye, EyeSlash } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  Link,
  Separator,
  Spinner,
  TextField,
  Typography,
} from "@heroui/react";
import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { getDefaultRouteForRole, useAuth } from "~/features/auth/AuthProvider";
import { ApiError } from "~/lib/apiError";
import { routePaths } from "~/routes/routePaths";

const FieldGroup = Fieldset.Group;

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const user = await login({ identifier, password });
      const redirectTo = searchParams.get("redirectTo");
      navigate(redirectTo || getDefaultRouteForRole(user.role), { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid h-screen grid-cols-1 gap-0 overflow-hidden bg-white p-2 lg:grid-cols-2 lg:rounded-[24px]">
      <Card
        className="min-h-[calc(100vh-16px)] w-full border-0 bg-white shadow-none flex justify-center flex-row"
        variant="transparent"
      >
        <Card.Content className="flex min-h-[calc(100vh-16px)] w-full max-w-[632px] flex-col px-5 py-8 sm:px-12 lg:mx-0">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[536px]">
              <header className="mb-6 space-y-2">
                <Typography.Heading
                  className="text-[24px] font-bold leading-[31px] text-[#111111]"
                  level={1}
                >
                  Đăng nhập
                </Typography.Heading>
                <Typography.Paragraph
                  className="max-w-[371px] text-[14px] leading-[18px] text-[#696969]"
                  size="sm"
                >
                  Tiếp tục đặt sân thể thao và tận hưởng không khí tuyệt vời.
                </Typography.Paragraph>
              </header>

              <Form className="w-full gap-0" onSubmit={handleSubmit}>
                <Fieldset className="w-full gap-0">
                  <Fieldset.Legend className="sr-only">
                    Thông tin đăng nhập
                  </Fieldset.Legend>
                  <Description className="sr-only">
                    Nhập email hoặc số điện thoại và mật khẩu để đăng nhập.
                  </Description>
                  <FieldGroup className="gap-0">
                    <TextField
                      className="w-full pb-3"
                      isRequired
                      name="identifier"
                      validate={(value) =>
                        value.trim().length === 0
                          ? "Email hoặc số điện thoại là bắt buộc"
                          : null
                      }
                    >
                      <Label>Email hoặc số điện thoại</Label>
                      <Input
                        className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px]! text-[#18181b] shadow-none outline-none placeholder:text-muted"
                        placeholder="nguyenvana@gmail.com"
                        type="text"
                      />
                      <FieldError />
                    </TextField>

                    <TextField
                      className="w-full pb-3"
                      isRequired
                      name="password"
                      validate={(value) =>
                        value.length === 0 ? "Mật khẩu là bắt buộc" : null
                      }
                    >
                      <Label>Mật khẩu</Label>
                      <InputGroup className={"shadow-none bg-default rounded-2xl"}>
                        <InputGroup.Input
                          className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px]! text-[#18181b] shadow-none outline-none placeholder:text-muted"
                          placeholder="yourpassword"
                          type={isVisible ? "text" : "password"}
                        />
                        <InputGroup.Suffix className="pr-1">
                          <Button
                            isIconOnly
                            aria-label={isVisible ? "Hide password" : "Show password"}
                            size="md"
                            variant="tertiary"
                            onPress={() => setIsVisible(!isVisible)}
                          >
                            {isVisible ? <Eye className="size-4" /> : <EyeSlash className="size-4" />}
                          </Button>
                        </InputGroup.Suffix>
                      </InputGroup>
                      <FieldError />
                    </TextField>
                  </FieldGroup>

                  <div className="flex w-full justify-end mb-2.5">
                    <Link
                      className="px-0.5 text-[14px] font-medium hover:underline! leading-5 text-[#18181b]"
                      href={routePaths.forgotPassword}
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Fieldset.Actions className="w-full">
                    <Button
                      className="h-11 w-full rounded-3xl text-[14px]! font-medium!"
                      isDisabled={isSubmitting}
                      type="submit"
                      variant="primary"
                    >
                      {isSubmitting ? <><Spinner /> <span>"Đang đăng nhập..."</span></> : "Đăng nhập"}
                    </Button>
                  </Fieldset.Actions>
                  {errorMessage && (
                    <Typography.Paragraph
                      className="mt-3 text-[13px] leading-5 text-danger"
                      size="sm"
                    >
                      {errorMessage}
                    </Typography.Paragraph>
                  )}
                </Fieldset>
              </Form>

              <div className="flex w-full items-center py-3 mt-3">
                <Separator className="h-px flex-1 bg-separator" />
                <Typography
                  className="px-3 text-[12px] font-medium leading-4 text-muted"
                  type="body-xs"
                >
                  OR
                </Typography>
                <Separator className="h-px flex-1 bg-separator" />
              </div>

              <div className="grid w-full grid-cols-1 gap-3 py-3 sm:grid-cols-2">
                <Button
                  className="h-11 w-full rounded-3xl px-4 text-[14px]! font-medium! text-[#18181b]"
                  variant="outline"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    src={"auth/logo-google.svg"}
                  />
                  Đăng nhập bằng Google
                </Button>
                <Button
                  className="h-11 w-full rounded-3xl px-4 text-[14px]! font-medium! text-[#18181b] flex"
                  variant="outline"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-5 mb-1 shrink-0"
                    src={"auth/logo-apple.svg"}
                  />
                  <span>Đăng nhập bằng Apple</span>
                </Button>
              </div>

              <Typography.Paragraph
                align="center"
                className="mt-4 text-[12px] leading-4 text-muted sm:mt-5"
                size="xs"
              >
                Bạn chưa có tài khoản?{" "}
                <Link
                  className="font-medium text-[#18181b] hover:text-primary! hover:underline!"
                  href={routePaths.register}
                >
                  Đăng ký ngay
                </Link>
              </Typography.Paragraph>
            </div>
          </div>

          <Link
            className="mx-auto mt-8 px-4 py-2 hover:border-secondary transition-all! border border-transparent font-bold rounded-full text-[#111111]"
            href={routePaths.home}
          >
            SportZone<span className="text-success">.</span>
          </Link>
        </Card.Content>
      </Card>

      <div className="hidden min-h-[calc(100vh-16px)] overflow-hidden rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_-6px_12px_rgba(0,0,0,0.03),0_14px_28px_rgba(0,0,0,0.08)] lg:block">
        <img
          alt="Sân bóng lúc hoàng hôn"
          className="h-full w-full object-cover"
          src="/auth/login-court.png"
        />
      </div>
    </section>
  );
}
