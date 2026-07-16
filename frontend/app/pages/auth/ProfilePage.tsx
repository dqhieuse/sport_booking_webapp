import {
  ArrowRightFromSquare,
  CircleInfo,
  Envelope,
  FloppyDisk,
  Handset,
  Person,
} from "@gravity-ui/icons";
import {
  Avatar,
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Separator,
  Select,
  Surface,
  Tabs,
  TextField,
  Typography,
} from "@heroui/react";
import { type FormEvent, type Key, useState } from "react";
import { useSearchParams } from "react-router";

import { usePageTransitionNavigate } from "~/components/common/PageTransition";
import { useAuth } from "~/features/auth/AuthProvider";
import { routePaths } from "~/routes/routePaths";

type ProfileTab = "account" | "security" | "spending" | "settings";

const profileTabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "account", label: "Thông tin cá nhân" },
  { id: "security", label: "Bảo mật" },
  { id: "spending", label: "Thống kê chi tiêu" },
  { id: "settings", label: "Tuỳ chọn" },
];

const defaultProfileTab: ProfileTab = "account";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigateWithTransition = usePageTransitionNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(() =>
    getProfileTabFromUrl(searchParams.get("tab")),
  );

  async function handleLogout() {
    await logout();
    navigateWithTransition(routePaths.home, { replace: true });
  }

  function handleTabChange(key: Key) {
    const nextTab = getProfileTabFromUrl(String(key));

    if (nextTab === activeTab) return;

    setActiveTab(nextTab);
    replaceProfileTabUrl(nextTab);
  }

  return (
    <section className="bg-white px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <Tabs
        aria-label="Tổng quan tài khoản"
        className="mx-auto flex w-full max-w-[1184px] flex-col gap-6 lg:flex-row lg:items-start lg:gap-2.5"
        orientation="vertical"
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
      >
        <aside className="w-full shrink-0 lg:w-xs" aria-label="Tổng quan tài khoản">
          <Typography
            className="mb-3 text-[14px] font-bold uppercase leading-6 text-black"
            type="body-sm"
          >
            Tổng quan tài khoản
          </Typography>

          <Tabs.ListContainer className="rounded-[20px] bg-[#ebebec]">
            <Tabs.List
              aria-label="Các mục hồ sơ"
              className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-0.5"
            >
              {profileTabs.map((tab) => (
                <Tabs.Tab
                  className="relative flex justify-start isolate h-10 shrink-0 rounded-3xl px-3 text-[14px] font-medium leading-5 text-[#71717a] transition-colors data-[selected]:text-[#18181b]"
                  id={tab.id}
                  key={tab.id}
                >
                  <span className="relative z-10">{tab.label}</span>
                  <Tabs.Indicator className="absolute inset-y-0 w-full! -z-10 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          <Button
            className="mt-2.5 h-11 rounded-2xl w-full flex justify-between font-medium! text-sm!"
            type="button"
            size="md"
            variant="danger-soft"
            onPress={() => void handleLogout()}
          >
            Đăng xuất
            <ArrowRightFromSquare className="size-4" aria-hidden="true" />
          </Button>
        </aside>

        <Card className="min-w-0 flex-1 rounded-3xl border-0 bg-[#f5f5f5] p-0 shadow-none">
          <Card.Content className="flex flex-col gap-6 p-4 sm:p-6">
            <Tabs.Panel className="flex flex-col gap-6 outline-none" id="account">
              <PersonalInfoPanel />
            </Tabs.Panel>
            <Tabs.Panel className="flex flex-col gap-6 outline-none" id="security">
              <SecurityPanel />
            </Tabs.Panel>
            <Tabs.Panel className="flex flex-col gap-6 outline-none" id="spending">
              <ComingSoonPanel
                title="Thống kê chi tiêu"
                description="Theo dõi tổng chi tiêu đặt sân, số lượt đặt và các xu hướng sử dụng tài khoản."
              />
            </Tabs.Panel>
            <Tabs.Panel className="flex flex-col gap-6 outline-none" id="settings">
              <ComingSoonPanel
                title="Tuỳ chọn"
                description="Thiết lập các tuỳ chọn cá nhân hoá cho trải nghiệm đặt sân của bạn."
              />
            </Tabs.Panel>
          </Card.Content>
        </Card>
      </Tabs>
    </section>
  );
}

function PersonalInfoPanel() {
  const { user } = useAuth();
  const initials = getUserInitials(user?.fullName);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleProfileModalSave() {
    setSuccessMessage("Giao diện đã sẵn sàng. Cần API cập nhật hồ sơ để lưu thay đổi.");
  }

  return (
    <>
      <ProfileHeading
        title="Thông tin cơ bản"
        description="Hãy chỉnh sửa bất kỳ thông tin chi tiết nào bên dưới để tài khoản của bạn luôn được cập nhật."
      />
      {successMessage && (
        <Typography.Paragraph className="text-[13px] leading-5 text-muted" size="sm">
          {successMessage}
        </Typography.Paragraph>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#e4e4e7] bg-white">
        <div className="flex gap-4 p-4">
          <Person className="mt-1 size-6 shrink-0 text-[#71717a]" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <InfoRow label="Họ và tên" value={user?.fullName} />
            <InfoRow label="Giới tính" />
            <InfoRow
              label="Ngày sinh"
              action={
                <ProfileModal
                  trigger={<EditButton />}
                  icon={<Person className="size-5" />}
                  title="Cập nhật thông tin cá nhân"
                  description="Chỉnh sửa họ và tên, giới tính và ngày sinh của bạn."
                  onSave={handleProfileModalSave}
                >
                  <TextField
                    className="w-full"
                    defaultValue={user?.fullName ?? ""}
                    isRequired
                    name="fullName"
                    validate={(value) =>
                      value.trim().length < 3
                        ? "Họ và tên phải có ít nhất 3 ký tự"
                        : null
                    }
                    variant="secondary"
                  >
                    <Label>Họ và tên</Label>
                    <Input className={"h-11 rounded-2xl"} placeholder="Nguyễn Văn A" />
                    <FieldError />
                  </TextField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ProfileSelect
                      label="Giới tính"
                      name="gender"
                      placeholder="Chọn giới tính"
                      items={[
                        { id: "MALE", label: "Nam" },
                        { id: "FEMALE", label: "Nữ" },
                        { id: "OTHER", label: "Khác" },
                      ]}
                    />
                    <ProfileDatePicker label="Ngày sinh" name="dateOfBirth" />
                  </div>
                </ProfileModal>
              }
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <Typography
                  className="text-[12px] leading-4 text-[#71717a]"
                  type="body-xs"
                >
                  Ảnh đại diện
                </Typography>
                <Avatar className="mt-2 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_35%,#c8f1e6_0,#8bd7ed_38%,#6c63ff_100%)]">
                  {user?.avatarUrl && (
                    <Avatar.Image alt={user.fullName} src={user.avatarUrl} />
                  )}
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar>
                <div className="mt-2 flex flex-wrap items-center gap-1 pr-2">
                  <span className="text-[12px] font-medium leading-4 text-[#18181b]">
                    Ảnh tải lên không vượt quá 5MB
                  </span>
                  <span className="text-[14px] font-medium leading-5 text-danger">*</span>
                </div>
              </div>
              <ProfileModal
                trigger={<EditButton />}
                icon={<Person className="size-5" />}
                title="Cập nhật ảnh đại diện"
                description="Chọn ảnh mới cho tài khoản. Ảnh tải lên không vượt quá 5MB."
                onSave={handleProfileModalSave}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_35%,#c8f1e6_0,#8bd7ed_38%,#6c63ff_100%)]">
                    {user?.avatarUrl && (
                      <Avatar.Image alt={user.fullName} src={user.avatarUrl} />
                    )}
                    <Avatar.Fallback>{initials}</Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Typography className="text-[14px] font-medium leading-5 text-[#18181b]">
                      Ảnh hiện tại
                    </Typography>
                    <Typography.Paragraph
                      className="text-[12px] leading-4 text-muted"
                      size="xs"
                    >
                      PNG, JPG hoặc WEBP. Tối đa 5MB.
                    </Typography.Paragraph>
                  </div>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium leading-5 text-[#18181b]">
                    Ảnh đại diện mới
                  </span>
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white p-4 text-[14px] text-[#18181b] file:mr-3 file:rounded-3xl file:border-0 file:bg-[#ebebec] file:px-4 file:py-2 file:text-[14px] file:font-medium file:text-[#1d63ae]"
                    name="avatar"
                    type="file"
                  />
                </label>
              </ProfileModal>
            </div>
          </div>
        </div>

        <ProfileSeparator />

        <ContactRow
          icon={<Envelope className="size-6" aria-hidden="true" />}
          label="Email"
          value={user?.email}
          action={
            <ProfileModal
              trigger={<EditButton />}
              icon={<Envelope className="size-5" />}
              title="Cập nhật email"
              description="Nhập email mới để dùng cho thông báo và đăng nhập tài khoản."
              onSave={handleProfileModalSave}
            >
              <TextField
                className="w-full"
                defaultValue={user?.email ?? ""}
                isRequired
                name="email"
                type="email"
                variant="secondary"
              >
                <Label>Email</Label>
                <Input placeholder="nguyenvana@gmail.com" />
                <FieldError />
              </TextField>
            </ProfileModal>
          }
        />

        <ProfileSeparator />

        <ContactRow
          icon={<Handset className="size-6" aria-hidden="true" />}
          label="Số điện thoại"
          value={user?.phone}
          action={
            <ProfileModal
              trigger={<EditButton />}
              icon={<Handset className="size-5" />}
              title="Cập nhật số điện thoại"
              description="Số điện thoại giúp sân liên hệ khi cần xác nhận lịch đặt."
              onSave={handleProfileModalSave}
            >
              <TextField
                className="w-full"
                defaultValue={user?.phone ?? ""}
                isRequired
                name="phone"
                validate={(value) =>
                  value.trim().length < 8 ? "Số điện thoại không hợp lệ" : null
                }
                variant="secondary"
              >
                <Label>Số điện thoại</Label>
                <Input placeholder="0841 192 888" />
                <FieldError />
              </TextField>
            </ProfileModal>
          }
        />
      </div>
    </>
  );
}

function SecurityPanel() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("Giao diện đã sẵn sàng. Cần API đổi mật khẩu để lưu thay đổi.");
  }

  return (
    <>
      <ProfileHeading
        title="Thông tin bảo mật tài khoản của bạn"
        description="Hãy chỉnh sửa bất kỳ thông tin chi tiết nào bên dưới để tài khoản của bạn luôn được cập nhật."
      />

      <Card className="rounded-3xl border border-[#e4e4e7] bg-white shadow-none">
        <Card.Content className="p-4">
          <Form className="gap-6" onSubmit={handleSubmit}>
            <Fieldset className="w-full gap-6">
              <div>
                <Typography
                  className="text-[16px] font-bold leading-6 text-[#1e1e1e]"
                  type="body-sm"
                >
                  Đổi mật khẩu
                </Typography>
                <Typography.Paragraph
                  className="mt-1 text-[12px] leading-4 text-[#757575]"
                  size="xs"
                >
                  Cập nhật mật khẩu cho tài khoản của bạn
                </Typography.Paragraph>
              </div>

              <PasswordField label="Mật khẩu cũ" name="currentPassword" />

              <div className="grid gap-2.5 md:grid-cols-2">
                <PasswordField label="Mật khẩu mới" name="newPassword" />
                <PasswordField label="Nhập lại mật khẩu mới" name="confirmPassword" />
              </div>

              <Fieldset.Actions>
                <Button
                  className="h-9 rounded-3xl px-4 text-[14px]! font-medium!"
                  type="submit"
                  variant="primary"
                >
                  <FloppyDisk className="size-4" aria-hidden="true" />
                  Cập nhật
                </Button>
              </Fieldset.Actions>

              {successMessage && (
                <Typography.Paragraph
                  className="text-[13px] leading-5 text-muted"
                  size="sm"
                >
                  {successMessage}
                </Typography.Paragraph>
              )}
            </Fieldset>
          </Form>
        </Card.Content>
      </Card>
    </>
  );
}

function ComingSoonPanel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <>
      <ProfileHeading
        title={title}
        description="Nội dung này đang được chuẩn bị cho các phiên bản tiếp theo của hồ sơ tài khoản."
      />
      <Card className="rounded-2xl border border-[#e4e4e7] bg-white shadow-none">
        <Card.Content className="p-4">
          <Typography className="text-[16px] font-bold leading-6 text-[#1e1e1e]">
            {title}
          </Typography>
          <Typography.Paragraph
            className="mt-1 max-w-[560px] text-[14px] leading-5 text-[#757575]"
            size="sm"
          >
            {description}
          </Typography.Paragraph>
        </Card.Content>
      </Card>
    </>
  );
}

function ProfileHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <header>
      <Typography.Heading
        className="text-[22px] font-bold leading-8 text-[#1e1e1e] sm:text-[24px]"
        level={1}
      >
        {title}
      </Typography.Heading>
      <Typography.Paragraph
        className="mt-1 max-w-full text-[14px] leading-5 text-[#757575]"
        size="sm"
      >
        {description}
      </Typography.Paragraph>
    </header>
  );
}

function InfoRow({
  action,
  label,
  value,
}: {
  action?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 pr-4">
        <Typography className="text-[12px] leading-4 text-[#71717a]" type="body-xs">
          {label}
        </Typography>
        <Typography className="text-[14px] font-medium leading-5 text-[#18181b]">
          {value || "Chưa cập nhật"}
        </Typography>
      </div>
      {action}
    </div>
  );
}

function ContactRow({
  action,
  icon,
  label,
  value,
}: {
  action?: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="shrink-0 text-[#71717a]">{icon}</span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0 pr-4">
          <Typography className="text-[12px] leading-4 text-[#71717a]" type="body-xs">
            {label}
          </Typography>
          <Typography className="break-words text-[14px] font-medium leading-5 text-[#18181b]">
            {value || "Chưa cập nhật"}
          </Typography>
        </div>
        {action ?? <EditButton />}
      </div>
    </div>
  );
}

function EditButton({ children = "Sửa" }: { children?: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={"text-sm! font-medium!"}
    >
      {children}
    </Button>
  );
}

function ProfileModal({
  children,
  description,
  icon,
  onSave,
  title,
  trigger,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  onSave: () => void;
  title: string;
  trigger: React.ReactNode;
}) {
  return (
    <Modal>
      {trigger}
      <Modal.Backdrop>
        <Modal.Container placement="auto" size="lg">
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header className="gap-0">
              <Modal.Icon className="bg-accent-soft mb-4 text-accent-soft-foreground">
                {icon}
              </Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
              <p className="text-sm leading-5 text-muted">{description}</p>
            </Modal.Header>
            <Modal.Body className="pt-4">
              <Surface variant="default">
                <form className="flex flex-col gap-4">{children}</form>
              </Surface>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary" className={"text-sm! font-medium!"}>
                Huỷ
              </Button>
              <Button slot="close" onPress={onSave} className={"text-sm! font-medium!"}>
                Lưu thay đổi
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function ProfileSelect({
  items,
  label,
  name,
  placeholder,
}: {
  items: Array<{ id: string; label: string }>;
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <Select className="w-full" name={name} placeholder={placeholder} variant="secondary">
      <Label>{label}</Label>
      <Select.Trigger className="h-11 rounded-2xl">
        <Select.Value className={"my-auto"}/>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((item) => (
            <ListBox.Item id={item.id} key={item.id} textValue={item.label}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function ProfileDatePicker({ label, name }: { label: string; name: string }) {
  return (
    <DatePicker className="w-full" name={name}>
      <Label>{label}</Label>
      <DateField.Group fullWidth variant="secondary" className={"h-11 rounded-2xl"}>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  return (
    <TextField
      className="w-full"
      isRequired
      name={name}
      validate={(value) => {
        if (value.length === 0) return `${label} là bắt buộc`;
        if (name !== "currentPassword" && value.length < 6) {
          return "Mật khẩu phải có ít nhất 6 ký tự";
        }
        return null;
      }}
    >
      <Label className="flex items-center gap-1 text-[14px] font-medium leading-5 text-[#18181b]">
        {label}
        <span className="text-danger">*</span>
        <CircleInfo className="size-3 text-[#71717a]" aria-hidden="true" />
      </Label>
      <InputGroup className="h-11 rounded-2xl border border-[#e4e4e7] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.06)]">
        <InputGroup.Input
          className="h-11 w-full rounded-2xl border-0 bg-transparent px-3 text-[14px]! text-[#18181b] outline-none placeholder:text-[#71717a]"
          placeholder="••••••••••••"
          type="password"
        />
      </InputGroup>
      <FieldError />
    </TextField>
  );
}

function ProfileSeparator() {
  return <Separator className="h-px w-full bg-[#e4e4e7]" />;
}

function getUserInitials(fullName?: string | null) {
  if (!fullName?.trim()) return "SZ";

  const words = fullName.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";

  return `${first}${last}`.toUpperCase();
}

function getProfileTabFromUrl(tab: string | null): ProfileTab {
  return profileTabs.some((profileTab) => profileTab.id === tab)
    ? (tab as ProfileTab)
    : defaultProfileTab;
}

function replaceProfileTabUrl(tab: ProfileTab) {
  const nextUrl = new URL(window.location.href);

  nextUrl.searchParams.set("tab", tab);
  window.history.replaceState(window.history.state, "", nextUrl);
}
