import { Eye, EyeSlash } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Checkbox,
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
import { useNavigate } from "react-router";

import { useAuth } from "~/features/auth/AuthProvider";
import { ApiError } from "~/lib/apiError";
import { routePaths } from "~/routes/routePaths";

const FieldGroup = Fieldset.Group;

function PasswordField({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      className="w-full"
      isRequired
      name={id}
      validate={(value) => {
        if (value.length < 6) {
          return "Mật khẩu phải có ít nhất 6 ký tự";
        }
        return null;
      }}
    >
      <Label>{label}</Label>
      <InputGroup className="rounded-2xl bg-default shadow-none">
        <InputGroup.Input
          className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px] text-[#18181b] shadow-none outline-none placeholder:text-muted"
          id={id}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
        />
        <InputGroup.Suffix className="pr-1">
          <Button
            aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            isIconOnly
            onPress={() => setIsVisible(!isVisible)}
            size="md"
            variant="tertiary"
          >
            {isVisible ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeSlash className="size-4" aria-hidden="true" />
            )}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      <FieldError />
    </TextField>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const hasAcceptedTerms = formData.get("basic-terms") === "on";

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (!hasAcceptedTerms) {
      setErrorMessage("Bạn cần đồng ý với điều kiện và điều khoản trước khi đăng ký.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ fullName, email, phone, password });
      navigate(`${routePaths.verifyEmail}?email=${encodeURIComponent(email)}`, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể đăng ký. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex h-screen justify-center overflow-y-auto bg-white px-5 py-8 sm:px-12 lg:rounded-[24px]">
      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-[1184px] flex-col items-center justify-center">
        <Card
          className="flex w-full max-w-[620px] flex-1 justify-center border-0 bg-white shadow-none"
          variant="transparent"
        >
          <Card.Content className="flex w-full flex-col justify-center">
            <header className="mb-4 space-y-2">
              <Typography.Heading
                className="text-[24px] font-bold leading-[31px] text-[#111111]"
                level={1}
              >
                Đăng ký
              </Typography.Heading>
              <Typography.Paragraph
                className="text-[14px] leading-[18px] text-[#696969]"
                size="sm"
              >
                Tạo tài khoản và chọn sân phù hợp với bạn
              </Typography.Paragraph>
            </header>

            <Form className="w-full gap-0 py-2" onSubmit={handleSubmit}>
              <Fieldset className="w-full">
                <Fieldset.Legend className="sr-only">
                  Thông tin đăng ký
                </Fieldset.Legend>
                <Description className="sr-only">
                  Nhập thông tin cá nhân để tạo tài khoản SportZone.
                </Description>
                <FieldGroup className="gap-0">
                  <TextField
                    className="w-full pb-4"
                    isRequired
                    name="fullName"
                    validate={(value) => {
                      if (value.trim().length < 3) {
                        return "Họ và tên phải có ít nhất 3 ký tự";
                      }
                      return null;
                    }}
                  >
                    <Label>Họ và tên</Label>
                    <Input
                      className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px]! text-[#18181b] shadow-none outline-none placeholder:text-muted"
                      placeholder="Nguyễn Văn A"
                      type="text"
                    />
                    <FieldError />
                  </TextField>

                  <TextField className="w-full pb-4" isRequired name="email" type="email">
                    <Label>Email</Label>
                    <Input
                      className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px]! text-[#18181b] shadow-none outline-none placeholder:text-muted"
                      placeholder="nguyenvana@gmail.com"
                    />
                    <FieldError />
                  </TextField>

                  <TextField
                    className="w-full pb-4"
                    isRequired
                    name="phone"
                    validate={(value) => {
                      if (value.trim().length < 8) {
                        return "Số điện thoại không hợp lệ";
                      }
                      return null;
                    }}
                  >
                    <Label>Số điện thoại</Label>
                    <Input
                      className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px]! text-[#18181b] shadow-none outline-none placeholder:text-muted"
                      placeholder="0901234567"
                      type="tel"
                    />
                    <FieldError />
                  </TextField>

                  <div className="flex md:flex-row flex-col md:gap-4 gap-0">
                    <PasswordField
                      id="password"
                      label="Mật khẩu"
                      placeholder="yourpassword"
                    />

                    <PasswordField
                      id="confirmPassword"
                      label="Nhập lại mật khẩu"
                      placeholder="yourpassword"
                    />
                  </div>

                  <Checkbox isRequired name="basic-terms" className={"mb-2"}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {`Bằng cách nhấp vào "Tiếp tục". Bạn đồng ý với điều kiện & điều khoản của SportZone.`}
                    </Checkbox.Content>
                  </Checkbox>
                </FieldGroup>

                <Fieldset.Actions className="w-full">
                  <Button
                    className="h-11 w-full rounded-3xl text-[14px]! font-medium!"
                    isDisabled={isSubmitting}
                    type="submit"
                    variant="primary"
                  >
                    {isSubmitting ? <><Spinner /> <span>"Đang đăng ký..."</span></> : "Đăng ký"}
                  </Button>
                  <Button type="reset" variant="secondary" className={"h-11 w-fit rounded-3xl text-[14px]! font-medium!"}>
                    Reset
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

            <div className="flex w-full items-center gap-1 py-4">
              <Separator className="h-px flex-1 bg-separator" />
              <Typography
                className="px-1 text-[11px] leading-[14px] text-[#696969]"
                type="body-xs"
              >
                hoặc
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
                  className="size-4 shrink-0"
                  src={"auth/logo-apple.svg"}
                />
                <span>Đăng nhập bằng Apple</span>
              </Button>
            </div>

            <Typography.Paragraph
              align="center"
              className="mt-4 text-[12px] leading-4 text-muted"
              size="xs"
            >
              Bạn đã có tài khoản?{" "}
              <Link
                className="font-medium text-[#18181b] hover:text-primary! hover:underline!"
                href={routePaths.login}
              >
                Đăng nhập ngay
              </Link>
            </Typography.Paragraph>
          </Card.Content>
        </Card>

        <Link
          className="mx-auto mt-8 rounded-full border border-transparent px-4 py-2 font-bold text-[#111111] transition-all! hover:border-secondary"
          href={routePaths.home}
        >
          SportZone<span className="text-success">.</span>
        </Link>
      </div>
    </section>
  );
}
