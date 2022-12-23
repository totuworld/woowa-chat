import { NextPage } from 'next';
import { Box } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/containers/service_layout';
import { useAuth } from '@/contexts/auth_user.context';

const CategoryPage: NextPage = function () {
  const { isOwner, authUser } = useAuth();
  return (
    <ServiceLayout height="100vh" backgroundColor="gray.50">
      <Box maxW="xl" mx="auto">
        {isOwner === false && authUser !== undefined && <p>관리자에게만 제공되는 기능입니다</p>}
      </Box>
    </ServiceLayout>
  );
};

export default CategoryPage;
