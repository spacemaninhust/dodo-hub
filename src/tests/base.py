import unittest

from flask import url_for, abort
from src import create_app
from src.extensions import db
from src.models import User, Collection, Question, Option, Answer


class BaseTestCase(unittest.TestCase):

    def setUp(self) -> None:
        app = create_app(config_name='test')

        self.context = app.test_request_context()
        self.context.push()
        self.client = app.test_client()
        self.runner = app.test_cli_runner()

        db.create_all()

        # TODO 测试数据准备

    def tearDown(self) -> None:
        db.drop_all()
        self.context.pop()

    def test_app_exist(self):
        self.assertFalse(create_app is None)
    def test_app_is_testing(self):
        self.assertTrue(create_app.config['TESTING'])

    def test_404_page(self):
        response = self.client.get('/nothing')  # 发送GET请求到'/nothing'端点
        data = response.get_data(as_text=True)  # 将响应数据作为文本检索
        # 检查响应数据中是否包含'404 Error'和'Go Back'字符串
        self.assertIn('404', data)
        # 检查响应状态代码是否等于404
        self.assertEqual(response.status_code, 404)

    def test_500_page(self):
        @create_app.route('/500')
        def internal_server_error_for_test():
            abort(500)
        response = self.client.get(' /500 ')
        data = response.get_data(as_text = True)
        self.assertEqual(response.status_code, 500)


    ###########以下的内容均依赖于../blueprints/下的内容###########

    def test_login(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/user/login')
        data = response.get_data(as_text=True)
        self.assertIn('Login page.', data)

        # 测试 POST 请求是否可以成功登录用户
        response = self.client.post('/user/login', data=dict(
            username='testuser',
            password='testpass'
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Login succeed!', data)
        # 测试 POST 请求对于非法或者不存在用户的反应。
        response = self.client.post('/user/login', data=dict(
            username='nonexistent_or_illegal_user',
            password='testpass'
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        # TODO 此处需要完善关于登录失败的内容
        self.assertIn('Login succeed!', data)


    def test_user_register_and_login(self):
        # 测试用户注册成功
        response = self.client.post('/user/register', data=dict(
            username='testuser',
            password='testpass'
        ))
        self.assertIn('Register succeed!', response.get_data(as_text=True))

        # 测试使用已注册的用户进行登录成功
        response = self.client.post('/user/login', data=dict(
            username='testuser',
            password='testpass'
        ), follow_redirects=True)
        self.assertIn('Login succeed!', response.get_data(as_text=True))

        # 测试使用非法字符用于注册，返回失败。在防sql注入和保证关键词唯一性上进行检查
        response = self.client.post('/user/register', data=dict(
            username='illegalname',
            password='testpass'
        ), follow_redirects=True)
        self.assertNotIn('Register failed!', response.get_data(as_text=True))


    def test_logout(self):
        # 测试用户logout成功
        response = self.client.get('/user/logout', follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Logout succeed.', data)

    def test_unregister(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/user/unregister')
        data = response.get_data(as_text=True)
        self.assertIn('Unregister.', data)

        # 测试 POST 请求是否可以成功注销用户
        response = self.client.post('/user/unregister', data=dict(
            username='testuser',
            password='testpass'
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Unregister succeed!', data)
        # 测试 POST 请求用户注销失败的情况
        response = self.client.post('/user/unregister', data=dict(
            username='nonexistent_or_illegal_user',
            password='testpass'
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Unregister failed!', data)

    def test_homepage(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/user/homepage')
        data = response.get_data(as_text=True)
        self.assertIn('Homepage.', data)

        # 测试 POST 请求是否正常工作
        response = self.client.post('/user/homepage', data=dict(
            # TODO: 根据实际情况编写测试代码，检查响应内容是否正确
        ))
        self.assertEqual(response.status_code, 200)
        data = response.get_data(as_text=True)
        self.assertIn('Homepage',data)


    ################测试collection蓝图##################
    def test_create_collection(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/collection/create')
        data = response.get_data(as_text=True)
        self.assertIn('Create collection.', data)

        # 测试 POST 请求是否可以成功创建收集
        response = self.client.post('/collection/create',data = (
            # TODO 按需进行编写
        ))
        self.assertEqual(response.status_code, 200)
        data = response.get_data(as_text=True)
        self.assertIn('Create collection succeed!', data)

    def test_edit_collection(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/collection/edit')
        data = response.get_data(as_text=True)
        self.assertIn('Edit collection.', data)

        # 测试 POST 请求是否可以成功编辑收集
        response = self.client.post('/collection/edit', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Edit collection succeed!', data)
    def test_delete_collection(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/collection/delete')
        data = response.get_data(as_text=True)
        self.assertIn('Delete collection', data)

        # 测试 POST 请求是否可以成功删除收集
        response = self.client.post('/collection/delete', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Delete collection succeed!', data)
    def test_restart_collection(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/collection/restart')
        data = response.get_data(as_text=True)
        self.assertIn('Restart collection.', data)

        # 测试 POST 请求是否可以成功重新开启收集
        response = self.client.post('/collection/restart', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Restart collection succeed!', data)

    def test_copy_collection(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/collection/copy')
        data = response.get_data(as_text=True)
        self.assertIn('Copy collection.', data)

        # 测试 POST 请求是否可以成功复制集合
        response = self.client.post('/collection/copy', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Copy collection succeed!', data)
    def test_preview_collection(self):
        # # 测试 GET 请求是否返回正确的预览数据
        response = self.client.get('/collection/preview')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Preview collection.', response.get_data(as_text=True))

    def test_details_of_collections(self):
        # 测试 GET 请求是否返回正确的收集详细数据
        response = self.client.get('/collection/details')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Details of your collections.', response.get_data(as_text=True))

    ################测试admin蓝图########################
    def test_create_class(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/admin/create_class')
        data = response.get_data(as_text=True)
        self.assertIn('Create class.', data)

        # 测试 POST 请求是否可以成功创建分类
        response = self.client.post('/admin/create_class', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Create class succeed!', data)

    def test_manage_class(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/admin/manage_class')
        data = response.get_data(as_text=True)
        self.assertIn('Manage class.', data)

        # 测试 POST 请求是否可以成功管理分类
        response = self.client.post('/admin/manage_class', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Manage class succeed!', data)

    def test_add_namelist(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/admin/add_namelist')
        data = response.get_data(as_text=True)
        self.assertIn('Add namelist.', data)

        # 测试 POST 请求是否可以成功添加名单
        response = self.client.post('/admin/add_namelist', data=dict(
            # TODO 按需进行编写
        ), follow_redirects=True)
        data = response.get_data(as_text=True)
        self.assertIn('Add namelist succeed!', data)

    def test_get_statistics(self):
        # 测试 GET 请求是否返回正确的统计数据
        response = self.client.get('/admin/statistics')
        data = response.get_data(as_text=True)
        self.assertIn('Statistics.', data)

    def test_show_dashboard(self):
        # 测试 GET 请求是否返回正确的表单数据
        response = self.client.get('/admin/dashboard')
        data = response.get_data(as_text=True)
        self.assertIn('Dashboard.', data)

