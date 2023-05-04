from urllib.parse import quote, unquote
import base64


def encryption(message: str) -> str:
    """加密函数，采用 base64

    Args:
        message (str): 待加密的信息

    Returns:
        (str): 加密后的信息
    """
    return base64.b64encode(quote(message).encode()).decode()


def decryption(message: str) -> str:
    """解密函数，采用 base64

    Args:
        message (str): 待解密的信息

    Returns:
        (str): 解密后的信息
    """
    return unquote(base64.b64decode(message).decode())
