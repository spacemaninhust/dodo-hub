FROM python:3.9 AS bulid


# 指定工作目录
WORKDIR /core

COPY  . /core

RUN pip install -r requirements.txt && \
    pip install python-dotenv && \
    pip freeze > requirements.txt.lock

#CMD ["python", "/core/Src/Flask/app.py"]
#CMD ["/bin/bash"]
# 暴露所有端口
EXPOSE 5000

#ENTRYPOINT [ "cd core && flask run" ]
CMD [ "flask", "run", "--host", "0.0.0.0", "--port", "5000" ]