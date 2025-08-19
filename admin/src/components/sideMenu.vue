<template>
  <n-layout-sider
    :collapsed="collapse"
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="250"
    @collapse="onCollapseMenu"
    @expand="onExpandMenu"
  >
    <div class="h-[calc(100vh-70px)]">
      <div
        class="h-[60px] flex justify-start items-center rounded-full overflow-clip ml-2 p-3 gap-2"
      >
        <img
          src="/public/logo_short.png"
          alt="LOGO"
          class="h-full rounded-md"
        />
        <p v-if="!collapse" class="text-2xl">V-Smash</p>
      </div>
      <n-menu
        v-model:value="activeRoute"
        :options="menus"
        :collapsed="collapse"
        default-expand-all
        :collapsed-width="64"
        :collapsed-icon-size="20"
        :indent="24"
        class="text-xs"
      ></n-menu>
    </div>
  </n-layout-sider>
</template>

<script setup lang="ts">
  import { NMenu, NLayoutSider } from 'naive-ui';
  import { type User } from '~/models';
  const props = defineProps<{
    user?: User;
  }>();

  const { menus } = useSideMenu(props.user?.role);
  const router = useRouter();
  const route = useRoute();
  const activeRoute = ref<string | null>(route.path.toString());
  const collapse = ref<boolean>(true);

  const onCollapseMenu = () => {
    collapse.value = true;
  };

  const onExpandMenu = () => {
    collapse.value = false;
  };
</script>
